import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { User } from '../auth/entities/user.entity';
import { Product } from '../ads/entities/ad.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { AdminService } from '../admin/admin.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
    private readonly adminService: AdminService,
    private readonly notificationsService: NotificationsService
  ) {}

  async buyProduct(productId: number, buyerId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.status === 'SOLD') throw new BadRequestException('Produit déjà vendu');
    if (product.ownerId === buyerId) throw new BadRequestException('Vous ne pouvez pas acheter votre propre produit');

    const buyer = await this.userRepo.findOne({ where: { id: buyerId } });
    const seller = await this.userRepo.findOne({ where: { id: product.ownerId } });

    if (!buyer) throw new NotFoundException('Acheteur introuvable');
    if (!seller) throw new NotFoundException('Vendeur introuvable');

    // Récupération des frais dynamiques
    const settings = await this.adminService.getPlatformSettings();
    const feePercentage = Number(settings.feePercentage) / 100;
    const feeFixed = Number(settings.feeFixed);

    const price = Number(product.price);
    const fee = (price * feePercentage) + feeFixed;
    const totalToPay = price + fee;

    if (Number(buyer.credits) < totalToPay) {
      throw new BadRequestException('Solde insuffisant pour couvrir le prix et les frais de transaction');
    }

    // Débit acheteur
    buyer.credits = Number(buyer.credits) - totalToPay;
    // Crédit "en attente" vendeur (sans les frais, qui vont à la plateforme)
    seller.pending_credits = Number(seller.pending_credits) + price;
    // Marquer produit vendu
    product.status = 'SOLD';

    await this.userRepo.save(buyer);
    await this.userRepo.save(seller);
    await this.productRepo.save(product);

    const transaction = this.transactionRepo.create({
      buyerId,
      sellerId: seller.id,
      productId: product.id,
      price: price,
      fee: fee,
      status: TransactionStatus.PENDING
    });

    const savedTransaction = await this.transactionRepo.save(transaction);
    
    // Notifications système
    await this.notificationsService.createNotification(
      seller.id,
      'Nouvel achat !',
      `Félicitations, ${buyer.pseudo} a acheté votre article "${product.title}". Veuillez préparer l'expédition.`,
      'TRANSACTION',
      `/transaction/${savedTransaction.id}`
    );
    await this.notificationsService.createNotification(
      buyer.id,
      'Commande confirmée',
      `Votre achat de "${product.title}" est confirmé. Le montant de ${totalToPay.toFixed(2)}€ a été mis en attente.`,
      'TRANSACTION',
      `/transaction/${savedTransaction.id}`
    );

    // Notifier les deux utilisateurs pour qu'ils actualisent leur solde
    this.chatGateway.notifyBalanceUpdate(buyerId);
    this.chatGateway.notifyBalanceUpdate(seller.id);

    return savedTransaction;
  }

  async confirmReception(transactionId: string, buyerId: string) {
    const transaction = await this.transactionRepo.findOne({ where: { id: transactionId }, relations: ['product'] });
    if (!transaction) throw new NotFoundException('Transaction introuvable');
    if (transaction.buyerId !== buyerId) throw new BadRequestException('Action non autorisée');
    if (transaction.status !== TransactionStatus.PENDING) throw new BadRequestException('Transaction déjà complétée ou annulée');

    const seller = await this.userRepo.findOne({ where: { id: transaction.sellerId } });
    if (!seller) throw new NotFoundException('Vendeur introuvable');
    
    // Transférer le solde en attente vers le solde disponible
    seller.pending_credits = Number(seller.pending_credits) - Number(transaction.price);
    seller.credits = Number(seller.credits) + Number(transaction.price);

    transaction.status = TransactionStatus.COMPLETED;

    await this.userRepo.save(seller);
    const savedTransaction = await this.transactionRepo.save(transaction);
    
    // Notification de réception pour le vendeur
    await this.notificationsService.createNotification(
      seller.id,
      'Argent débloqué !',
      `L'acheteur a confirmé la réception de "${transaction.product?.title || 'votre article'}". Les fonds (${transaction.price}€) sont maintenant disponibles sur votre solde !`,
      'TRANSACTION',
      `/transaction/${savedTransaction.id}`
    );

    // Notifier le vendeur pour qu'il actualise son solde disponible
    this.chatGateway.notifyBalanceUpdate(seller.id);

    return savedTransaction;
  }

  async getUserTransactions(userId: string) {
    const purchases = await this.transactionRepo.find({
      where: { buyerId: userId },
      relations: ['product', 'seller'],
      order: { createdAt: 'DESC' }
    });

    const sales = await this.transactionRepo.find({
      where: { sellerId: userId },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' }
    });

    return { purchases, sales };
  }

  async getFees() {
    return this.adminService.getPlatformSettings();
  }

  async findOne(id: number | string) {
    return this.transactionRepo.findOne({ where: { id: String(id) } });
  }

  async markAsReviewed(transactionId: string, isBuyer: boolean) {
    const transaction = await this.transactionRepo.findOne({ where: { id: transactionId } });
    if (transaction) {
      if (isBuyer) {
        transaction.buyerReviewed = true;
      } else {
        transaction.sellerReviewed = true;
      }
      await this.transactionRepo.save(transaction);
    }
  }
}
