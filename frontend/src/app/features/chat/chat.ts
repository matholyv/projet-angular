import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import { TransactionService } from '../../core/services/transaction';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  currentUser: any = null;
  conversations: any[] = [];
  messages: any[] = [];
  newMessage: string = '';
  
  activeConvo: any = null;
  activeAd: any = null;
  activeTransaction: any = null;
  pollInterval: any;
  unreadMap: { [key: string]: number } = {};
  private wsSub!: Subscription;
  private subs = new Subscription();

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private adService: AdService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    // Force la page à rester en haut au chargement et bloque la mémoire d'ascenseur du navigateur
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      // Récupération de l'ID garanti ! 
      this.currentUser.id = this.currentUser.id || this.currentUser.userId || this.currentUser.sub;
      
      this.loadInbox();

      // Vérifier s'il y a des paramètres d'initialisation (venant d'une annonce)
      this.subs.add(
        this.route.queryParams.subscribe(params => {
          if (params['partnerId'] && params['adId']) {
             this.chatService.setActiveConversation(params['adId'], params['partnerId']);
             this.initConversation(params['adId'], params['partnerId'], params['partnerName']);
          } else {
             this.chatService.setActiveConversation(null, null);
             this.activeConvo = null; // Il manquait cette ligne !
             this.activeAd = null;
             this.activeTransaction = null;
             if (this.conversations) {
               this.conversations.forEach(c => c.active = false);
             }
          }
        })
      );

      // Écouter les changements des compteurs de messages non lus
      this.subs.add(
        this.chatService.unreadCounts$.subscribe(counts => {
          this.unreadMap = counts;
          // Mettre à jour les conversations existantes
          this.conversations.forEach(c => {
            const key = `${c.adId}_${c.partnerId}`;
            c.unreadCount = counts[key] || 0;
          });
          this.cdr.detectChanges();
        })
      );

      // Identifier la socket
      this.chatService.identify(String(this.currentUser.id));

      // Écouter les nouveaux messages en temps réel
      this.wsSub = this.chatService.newMessage$.subscribe((msg: any) => {
        if (this.activeConvo && String(msg.ad_id) === String(this.activeConvo.adId)) {
          const isParticipant = String(msg.sender_id) === String(this.activeConvo.partnerId) || 
                                String(msg.sender_id) === String(this.currentUser.id);
          
          if (isParticipant) {
            const exists = this.messages.find(m => m.id === msg._id);
            if (!exists) {
              this.messages.push({
                id: msg._id,
                senderId: String(msg.sender_id),
                text: msg.content,
                timestamp: new Date(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
              });
              this.cdr.detectChanges();
            }
          }
        }
        // Rafraîchir l'inbox pour tous les autres messages
        this.loadInbox();
      });
    }
  }

  ngOnDestroy() {
    this.chatService.setActiveConversation(null, null);
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
    this.subs.unsubscribe();
  }

  private previousMsgCount = 0;

  loadInbox() {
    if (!this.currentUser) return;

    this.chatService.getInbox(String(this.currentUser.id)).subscribe({
      next: (convos) => {
        // Obtenir la liste actualisée tout en préservant le pseudo s'il est déjà connu en mémoire
        this.conversations = convos.map(c => {
          const pastConvo = this.conversations.find(old => String(old.adId) === String(c.adId) && String(old.partnerId) === String(c.partnerId));
          const hasGoodName = pastConvo?.partnerName && !pastConvo.partnerName.match(/^[a-f0-9]{8}$/i);
          const key = `${c.adId}_${c.partnerId}`;
          const unreadCount = this.unreadMap[key] || 0;
          return {
            adId: String(c.adId),
            partnerId: String(c.partnerId),
            partnerName: c.partnerName || (hasGoodName ? pastConvo.partnerName : String(c.partnerId).substring(0, 8)),
            lastMessage: c.lastMessage,
            unreadCount: unreadCount,
            adTitle: c.adTitle,
            adImage: c.adImage,
            active: this.activeConvo && String(this.activeConvo.adId) === String(c.adId) && String(this.activeConvo.partnerId) === String(c.partnerId)
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur inbox", err)
    });
  }

  initConversation(adId: string, partnerId: string, partnerName?: string) {
    const validName = partnerName || String(partnerId).substring(0, 8);
    this.activeConvo = { adId: String(adId), partnerId: String(partnerId), partnerName: validName };
    if (this.conversations) {
      this.conversations.forEach(c => c.active = false);
    }
    
    // On ajoute virtuellement la convo si elle n'existe pas encore dans l'inbox
    let existingLog = this.conversations.find(c => String(c.adId) === String(adId) && String(c.partnerId) === String(partnerId));
    if (!existingLog) {
        this.conversations.unshift({
            adId: String(adId), partnerId: String(partnerId), partnerName: validName, lastMessage: 'Nouvelle conversation', unreadCount: 0, active: true
        });
    } else {
       existingLog.active = true;
       if (partnerName) {
           existingLog.partnerName = partnerName;
       }
    }
    
    this.loadAdAndTransaction(adId);
    this.loadConversation(String(adId), String(partnerId));
  }

  loadConversation(adId: string, partnerId: string) {
    this.chatService.getConversation(String(adId), String(this.currentUser.id), String(partnerId)).subscribe({
      next: (msgs) => {
        this.messages = msgs.map(m => ({
          id: m._id,
          senderId: String(m.sender_id),
          text: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur historique", err)
    });
  }

  loadAdAndTransaction(adId: string) {
    this.activeAd = null;
    this.activeTransaction = null;
    if (!adId) return;

    this.adService.getAdById(adId).subscribe({
      next: (ad) => {
        let finalImageUrl = ad.image_data || '';
        if (finalImageUrl.startsWith('["')) {
          try {
            const images = JSON.parse(finalImageUrl);
            finalImageUrl = images[0] || '';
          } catch (e) {
            finalImageUrl = finalImageUrl.replace(/\["|"]/g, '');
          }
        }
        this.activeAd = {
          ...ad,
          imageUrl: finalImageUrl
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement ad en-tête chat", err)
    });

    this.transactionService.getMyTransactions().subscribe({
      next: (data) => {
        const all = [...(data.purchases || []), ...(data.sales || [])];
        this.activeTransaction = all.find(t => String(t.productId) === String(adId)) || null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement transaction en-tête chat", err)
    });
  }

  selectConversation(convo: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        adId: convo.adId,
        partnerId: convo.partnerId,
        partnerName: convo.partnerName
      },
      queryParamsHandling: 'merge'
    });
  }

  closeConversation() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { adId: null, partnerId: null, partnerName: null },
      queryParamsHandling: 'merge'
    });
  }

  ngAfterViewChecked() {
    // Évite que la page remonte à chaque rafraîchissement silencieux
    if (this.messages.length !== this.previousMsgCount) {
      this.scrollToBottom();
      this.previousMsgCount = this.messages.length;
    }
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.activeConvo && this.currentUser) {
      const msgData = {
        ad_id: String(this.activeConvo.adId),
        sender_id: String(this.currentUser.id),
        receiver_id: String(this.activeConvo.partnerId),
        content: String(this.newMessage.trim())
      };

      this.chatService.sendMessage(msgData).subscribe({
        next: (savedMsg) => {
          // On vérifie si le WebSocket ne l'a pas déjà ajouté pour éviter les doublons
          const exists = this.messages.find(m => m.id === savedMsg._id);
          if (!exists) {
            this.messages.push({
              id: savedMsg._id,
              senderId: String(savedMsg.sender_id),
              text: savedMsg.content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
            });
          }
          this.newMessage = '';
          this.loadInbox(); // Rafraîchir la liste de gauche
          this.cdr.detectChanges(); // FORCER l'affichage dynamique (Evite de devoir cliquer sur l'écran)
        },
        error: (err) => console.error("Erreur d'envoi", err)
      });
    }
  }
}
