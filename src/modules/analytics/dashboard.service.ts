import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Schema } from 'mongoose';
import { Commande } from '../../models/commande.schema';
import { User } from '../../models/user.schema';

@Injectable()
export class DashboardService {
  private dashboardAnalyticsModel: Model<any>;
  constructor(
    @InjectModel(Commande.name) private orderModel: Model<Commande>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('DATABASE_CONNECTION') private readonly connection: Connection,
  ) {
    if (this.connection.models['dashboard_analytics']) {
      this.dashboardAnalyticsModel = this.connection.models['dashboard_analytics'];
    } else {
      this.dashboardAnalyticsModel = this.connection.model(
        'dashboard_analytics',
        new Schema({}, { strict: false, collection: 'dashboard_analytics' })
      );
    }
  }

  async getMetrics(range: string) {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc) return {};

    // Use commandes and users arrays from analytics doc
    const commandes: any[] = Array.isArray(doc.commandes) ? doc.commandes : [];
    const users: any[] = Array.isArray(doc.users) ? doc.users : [];

    // Calculate date range
    const now = new Date();
    let start: Date;
    if (range === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (range === '90d') start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // All-time users
    const totalUsers = users.length;

    // New users in range
    const newUsers = users.filter(u => {
      const d = u.created_at ? new Date(u.created_at) : null;
      return d && d >= start;
    }).length;
    const prevUsers = users.filter(u => {
      const d = u.created_at ? new Date(u.created_at) : null;
      return d && d < start;
    }).length;

    // All-time orders
    const totalOrders = commandes.length;

    // New orders in range
    const newOrders = commandes.filter(o => {
      const d = o.created_at ? new Date(o.created_at) : null;
      return d && d >= start;
    }).length;
    const prevOrders = commandes.filter(o => {
      const d = o.created_at ? new Date(o.created_at) : null;
      return d && d < start;
    }).length;

    // Sales (prix_ttc as number)
    const sales = commandes
      .filter(o => {
        const d = o.created_at ? new Date(o.created_at) : null;
        return d && d >= start;
      })
      .reduce((sum, o) => sum + (typeof o.prix_ttc === 'string' ? parseFloat(o.prix_ttc) : Number(o.prix_ttc) || 0), 0);

    // Sessions (dummy, unless you track sessions elsewhere)
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
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc) return [];

    const users: any[] = Array.isArray(doc.users) ? doc.users : [];
    const commandes: any[] = Array.isArray(doc.commandes) ? doc.commandes : [];

    const recentUsers = users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    const recentOrders = commandes
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    const activities = [
      ...recentUsers.map(u => ({
        user: u.name || u.email,
        action: "registered",
        type: "create",
        time: u.created_at ? new Date(u.created_at) : null,
        avatar: null,
        resource: "User"
      })),
      ...recentOrders.map(o => ({
        user: o.nom || o.email,
        action: "placed an order",
        type: "create",
        time: o.created_at ? new Date(o.created_at) : null,
        avatar: null,
        resource: "Order"
      }))
    ].sort((a, b) => new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime());

    return activities.slice(0, limit);
  }
}