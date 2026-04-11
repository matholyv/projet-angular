import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  // L'utilisateur connecté (simulation)
  currentUser = { id: 1, pseudo: 'Moi' };

  // Conversations (Sidebar de gauche)
  conversations = [
    { id: 1, partnerName: 'ToulouseVintage', lastMessage: 'Oui, toujours dispo !', unreadCount: 1, active: true },
    { id: 2, partnerName: 'Jeanne31', lastMessage: 'Je peux descendre le prix à 15€', unreadCount: 0, active: false }
  ];

  // Messages (Fenêtre de droite)
  messages = [
    { id: 1, senderId: 2, text: 'Bonjour, est-ce que la veste est toujours disponible ?', timestamp: '10:00' },
    { id: 2, senderId: 1, text: 'Bonjour ! Oui bien sûr, elle est prête à être expédiée.', timestamp: '10:05' },
    { id: 3, senderId: 2, text: 'Oui, toujours dispo !', timestamp: '10:07' }
  ];

  newMessage: string = '';

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: Date.now(),
        senderId: this.currentUser.id,
        text: this.newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
      });
      // Met à jour la preview de la sidebar
      const activeConvo = this.conversations.find(c => c.active);
      if (activeConvo) activeConvo.lastMessage = this.newMessage.trim();

      this.newMessage = '';
    }
  }

  selectConversation(convoId: number) {
    this.conversations.forEach(c => c.active = false);
    const selected = this.conversations.find(c => c.id === convoId);
    if (selected) {
      selected.active = true;
      selected.unreadCount = 0;
    }
  }
}
