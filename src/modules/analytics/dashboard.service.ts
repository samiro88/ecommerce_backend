import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Commande } from '../../models/commande.schema';
import { User } from '../../models/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Commande.name) private orderModel: Model<Commande>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getMetrics(range: string) {
    // Calculate date range
    const now = new Date();
    let start: Date;
    if (range === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (range === '90d') start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // All-time users
    const totalUsers = await this.userModel.countDocuments({});
    // New users in range
    const newUsers = await this.userModel.countDocuments({ created_at: { $gte: start } });
    const prevUsers = await this.userModel.countDocuments({ created_at: { $lt: start } });

    // All-time orders
    const totalOrders = await this.orderModel.countDocuments({});
    // New orders in range
    const newOrders = await this.orderModel.countDocuments({ created_at: { $gte: start } });
    const prevOrders = await this.orderModel.countDocuments({ created_at: { $lt: start } });

    // Sales (replace 'prix_ttc' with your actual total field if needed)
    const salesAgg = await this.orderModel.aggregate([
      { $match: { created_at: { $gte: start } } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$prix_ttc" } } } }
    ]);
    const sales = salesAgg[0]?.total || 0;

    // Sessions (dummy, replace with real if you track sessions)
    const sessions = Math.floor(Math.random() * 1000) + 100;

    return {
      totalUsers: { value: totalUsers },
      newUsers: { value: newUsers, change: prevUsers ? `+${(((newUsers - prevUsers) / prevUsers) * 100).toFixed(1)}%` : "+0%" },
      sales: { value: sales, change: "+2.3%" },
      totalOrders: { value: totalOrders },
      newOrders: { value: newOrders, change: prevOrders ? `+${(((newOrders - prevOrders) / prevOrders) * 100).toFixed(1)}%` : "+0%" },
      sessions: { value: sessions, change: "+8%" }
    };
  }

  async getRecentActivity(limit: number) {
    const recentUsers = await this.userModel.find().sort({ created_at: -1 }).limit(limit).lean();
    const recentOrders = await this.orderModel.find().sort({ created_at: -1 }).limit(limit).lean();

    const activities = [
      ...recentUsers.map(u => ({
        user: u.name || u.email,
        action: "registered",
        type: "create",
        time: new Date((u as any).created_at),
        avatar: null,
        resource: "User"
      })),
      ...recentOrders.map(o => ({
        user: o.nom || o.email,
        action: "placed an order",
        type: "create",
        time: new Date(o.created_at),
        avatar: null,
        resource: "Order"
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return activities.slice(0, limit);
  }
}