import { Injectable, Logger } from '@nestjs/common';
import { Telegraf, Context, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

interface SessionData {
  step?: string;
  name?: string;
  age?: number;
  phone?: string;
  region?: string;
  district?: string;
  channels?: string[];
  userId?: number;
}

interface SessionContext extends Context {
  session?: SessionData;
}

@Injectable()
export class TelegramService {
  private bot: Telegraf<SessionContext>;
  private readonly logger = new Logger(TelegramService.name);
  private sessions: Map<number, SessionData> = new Map();
  private uploadDir = path.join(process.cwd(), 'uploads');

  // Viloyatlar va tumanlar
  private regions = {
    'Tashkent City': ['Yunusobod', 'Bektemir', 'Mirzo Ulugbek', 'Yakkasaroy', 'Chilonzor', 'Shaykhontahur', 'Sergeli'],
    'Andijan': ['Andijan', 'Asaka', 'Baliqchi', 'Jalaquduq'],
    'Bukhara': ['Bukhara', 'Gijduvon', 'Karakul', 'Romitan'],
    'Fergana': ['Fergana', 'Margilan', 'Quvasoy', 'Rishtan'],
    'Jizzakh': ['Jizzakh', 'Dostlik', 'Zarbdor', 'Zafarabad'],
    'Kashkadarya': ['Karshi', 'Shakhrisabz', 'Koson', 'Mubarek'],
    'Navoi': ['Navoi', 'Zarafshan', 'Kungrad', 'Tamdy'],
    'Namangan': ['Namangan', 'Chust', 'Yangikurgan', 'Uychi'],
    'Samarkand': ['Samarkand', 'Kattakurgan', 'Narpay', 'Urgut'],
    'Sirdarya': ['Guliston', 'Yangier', 'Syrdarya', 'Oqqoʻrgon'],
    'Surkhandarya': ['Termiz', 'Denov', 'Qumqoʻrgon', 'Boysun'],
    'Tashkent Region': ['Tashkent', 'Chinoz', 'Oʻrtachirchiq', 'Kibray'],
    'Khorezm': ['Urganch', 'Khiva', 'Shavat', 'Bagat'],
  };

  constructor(private prisma: PrismaService) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }
    this.bot = new Telegraf(token);
    this.setupMiddleware();
    this.setupHandlers();
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getSession(userId: number): SessionData {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, { userId });
    }
    return this.sessions.get(userId)!;
  }

  private clearSession(userId: number): void {
    this.sessions.delete(userId);
  }

  private setupMiddleware() {
    this.bot.use((ctx, next) => {
      if (ctx.from) {
        ctx.session = this.getSession(ctx.from.id);
      }
      return next();
    });
  }

  private setupHandlers() {
    // START COMMAND
    this.bot.start((ctx) => this.handleStart(ctx));

    // REGISTRATION ACTION
    this.bot.action('start_registration', (ctx) => this.handleStartRegistration(ctx));
    this.bot.action(/^region_/, (ctx) => this.handleRegionSelect(ctx));
    this.bot.action(/^district_/, (ctx) => this.handleDistrictSelect(ctx));
    this.bot.action('add_channel', (ctx) => this.handleAddChannel(ctx));
    this.bot.action('skip_channels', (ctx) => this.handleSkipChannels(ctx));
    this.bot.action('confirm_registration', (ctx) => this.handleConfirmRegistration(ctx));
    this.bot.action('cancel_registration', (ctx) => this.handleCancelRegistration(ctx));

    // TEXT INPUT HANDLERS
    this.bot.hears(/^[a-zA-Z\s]+$/i, (ctx) => this.handleNameInput(ctx));
    this.bot.hears(/^\d+$/, (ctx) => this.handleAgeInput(ctx));
    this.bot.hears(/^\+?[\d\s\-()]+$/, (ctx) => this.handlePhoneInput(ctx));

    // TEXT MESSAGE HANDLER (for channel links)
    this.bot.on('text', (ctx) => this.handleTextMessage(ctx));
  }

  async launch() {
    await this.bot.launch();
    this.logger.log('✅ Telegram bot launched successfully!');
  }

  // START HANDLER
  private async handleStart(ctx: SessionContext) {
    const user = ctx.from;
    if (!user) return;

    this.clearSession(user.id);
    const session = this.getSession(user.id);
    session.userId = user.id;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📝 Ro\'yxatdan o\'tish', 'start_registration')],
    ]);

    await ctx.reply(
      `👋 Assalomu alaykum, ${user.first_name}!\n\nBu CRM sistemamizga xush kelibsiz.\n\nRo'yxatdan o'tish uchun tugmani bosing:`,
      keyboard,
    );
  }

  // START REGISTRATION
  private async handleStartRegistration(ctx: SessionContext) {
    if (!ctx.session) return;

    ctx.session.step = 'name';
    await ctx.editMessageText('📝 Iltimos, to\'liq ismingizni kiriting:');
  }

  // NAME INPUT
  private async handleNameInput(ctx: SessionContext) {
    if (!ctx.session || ctx.session.step !== 'name') return;

    const text = (ctx.message as any)?.text;
    if (!text || text.length < 2) {
      await ctx.reply('❌ Ismingiz kamida 2 ta harfdan iborat bo\'lishi kerak. Qayta kiriting:');
      return;
    }

    ctx.session.name = text;
    ctx.session.step = 'age';

    await ctx.reply('👤 Ismingiz: ' + text + '\n\n📅 Endi yoshingizni kiriting (raqam):');
  }

  // AGE INPUT
  private async handleAgeInput(ctx: SessionContext) {
    if (!ctx.session || ctx.session.step !== 'age') return;

    const age = parseInt((ctx.message as any)?.text || '', 10);
    if (isNaN(age) || age < 10 || age > 120) {
      await ctx.reply('❌ Yoshingiz 10 dan 120 gacha bo\'lishi kerak. Qayta kiriting:');
      return;
    }

    ctx.session.age = age;
    ctx.session.step = 'phone';

    await ctx.reply(
      `👤 Ismingiz: ${ctx.session.name}\n📅 Yoshingiz: ${age}\n\n📱 Telefon raqamingizni kiriting (masalan: +998901234567):`,
    );
  }

  // PHONE INPUT
  private async handlePhoneInput(ctx: SessionContext) {
    if (!ctx.session || ctx.session.step !== 'phone') return;

    const phone = (ctx.message as any)?.text || '';
    const phoneRegex = /^\+?998\d{9}$/;

    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
      await ctx.reply('❌ Telefon raqami noto\'g\'ri format. Qayta kiriting (+998XXXXXXXXX):');
      return;
    }

    ctx.session.phone = phone;
    ctx.session.step = 'region';

    // Show regions
    const regionButtons = Object.keys(this.regions).map((region) =>
      [Markup.button.callback(region, `region_${region}`)],
    );

    const keyboard = Markup.inlineKeyboard(regionButtons);

    await ctx.reply(
      `👤 Ismingiz: ${ctx.session.name}\n📅 Yoshingiz: ${ctx.session.age}\n📱 Telefon: ${phone}\n\n🗺️ Viloyatingizni tanlang:`,
      keyboard,
    );
  }

  // REGION SELECT
  private async handleRegionSelect(ctx: SessionContext) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const region = (ctx.callbackQuery as any).data.replace('region_', '');
    ctx.session!.region = region;
    ctx.session!.step = 'district';

    const districts = this.regions[region] || [];
    const districtButtons = districts.map((district) =>
      [Markup.button.callback(district, `district_${district}`)],
    );

    const keyboard = Markup.inlineKeyboard(districtButtons);

    await ctx.editMessageText(
      `👤 Ismingiz: ${ctx.session!.name}\n📅 Yoshingiz: ${ctx.session!.age}\n📱 Telefon: ${ctx.session!.phone}\n🗺️ Viloyat: ${region}\n\n📍 Tumanningizni tanlang:`,
      keyboard,
    );
  }

  // DISTRICT SELECT
  private async handleDistrictSelect(ctx: SessionContext) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const district = (ctx.callbackQuery as any).data.replace('district_', '');
    ctx.session!.district = district;
    ctx.session!.step = 'channels';
    ctx.session!.channels = [];

    const channelButtons = [
      [Markup.button.callback('➕ Kanal qo\'shish', 'add_channel')],
      [Markup.button.callback('⏭️ O\'tkazib yuborish (2+ kanal kerak)', 'skip_channels')],
    ];

    const keyboard = Markup.inlineKeyboard(channelButtons);

    await ctx.editMessageText(
      `👤 Ismingiz: ${ctx.session!.name}\n📅 Yoshingiz: ${ctx.session!.age}\n📱 Telefon: ${ctx.session!.phone}\n🗺️ Viloyat: ${ctx.session!.region}\n📍 Tuman: ${district}\n\n📺 Obuna bo'lgan kanallar (kamasi 2 ta):\n${
        ctx.session!.channels.length > 0 ? ctx.session!.channels.join('\n') : '❌ Hozircha yo\'q'
      }\n\nKanal qo\'shing:`,
      keyboard,
    );
  }

  // ADD CHANNEL
  private async handleAddChannel(ctx: SessionContext) {
    ctx.session!.step = 'adding_channel';
    await ctx.reply(
      '📺 Kanal linkini yoki @ nomini kiriting (masalan: @uzsbek_kanal yoki https://t.me/uzsbek_kanal):',
    );
  }

  // HANDLE CHANNEL TEXT
  private async handleTextMessage(ctx: SessionContext) {
    if (!ctx.session || ctx.session.step !== 'adding_channel') return;

    const text = (ctx.message as any)?.text || '';

    // Validate channel
    const channelRegex = /^(@[\w]+|https?:\/\/t\.me\/[\w]+)$/;
    if (!channelRegex.test(text)) {
      await ctx.reply('❌ Kanal formatini to\'g\'ri kiriting. Masalan: @kanal yoki https://t.me/kanal');
      return;
    }

    if (!ctx.session.channels) {
      ctx.session.channels = [];
    }

    ctx.session.channels.push(text);
    ctx.session.step = 'district';

    const channelButtons = [
      [Markup.button.callback('➕ Yana kanal qo\'shish', 'add_channel')],
      [Markup.button.callback('✅ Tayyor', 'skip_channels')],
    ];

    const keyboard = Markup.inlineKeyboard(channelButtons);

    await ctx.reply(
      `✅ Kanal qo\'shildi!\n\n📺 Obuna bo'lgan kanallar:\n${ctx.session.channels.join('\n')}\n\n${
        ctx.session.channels.length >= 2
          ? '📝 Ro\'yxatdan o\'tish tayyor, tasdiqlang!'
          : '⚠️ Kamasi 2 ta kanal kerak!'
      }`,
      keyboard,
    );
  }

  // SKIP CHANNELS
  private async handleSkipChannels(ctx: SessionContext) {
    if (!ctx.session || !ctx.session.channels || ctx.session.channels.length < 2) {
      await ctx.answerCbQuery('❌ Kamasi 2 ta kanal qo\'shish kerak!', { show_alert: true });
      return;
    }

    ctx.session.step = 'confirm';

    const confirmButtons = [
      [Markup.button.callback('✅ Tasdiqlash', 'confirm_registration')],
      [Markup.button.callback('❌ Bekor qilish', 'cancel_registration')],
    ];

    const keyboard = Markup.inlineKeyboard(confirmButtons);

    const summary = `
📋 RO'YXATDAN O'TISH JADVALI

👤 Ism: ${ctx.session.name}
📅 Yosh: ${ctx.session.age}
📱 Telefon: ${ctx.session.phone}
🗺️ Viloyat: ${ctx.session.region}
📍 Tuman: ${ctx.session.district}
📺 Kanallar: ${ctx.session.channels.join(', ')}

☝️ Hamma ma'lumotlar to'g\'ri ekanligini tasdiqlang:`;

    await ctx.editMessageText(summary, keyboard);
  }

  // CONFIRM REGISTRATION
  private async handleConfirmRegistration(ctx: SessionContext) {
    if (!ctx.session) return;

    try {
      // Save to database
      const createdUser = await (this.prisma as any).user.create({
        data: {
          telegramId: ctx.session.userId!,
          name: ctx.session.name!,
          age: ctx.session.age!,
          phone: ctx.session.phone!,
          region: ctx.session.region!,
          district: ctx.session.district!,
          channels: ctx.session.channels!,
        },
      });

      this.clearSession(ctx.session.userId!);

      await ctx.editMessageText(
        `✅ RO'YXATDAN O'TDI!\n\n${ctx.session.name}, sizni sistemamizga xush kelibsiz!\n\nID: ${createdUser.id}`,
      );
    } catch (error) {
      this.logger.error('Registration error:', error);
      await ctx.reply('❌ Ro\'yxatdan o\'tishda xatolik yuz berdi. Qayta urinib ko\'ring.');
    }
  }

  // CANCEL REGISTRATION
  private async handleCancelRegistration(ctx: SessionContext) {
    if (!ctx.session) return;

    this.clearSession(ctx.session.userId!);
    const startKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📝 Ro\'yxatdan o\'tish', 'start_registration')],
    ]);

    await ctx.editMessageText(
      '❌ Ro\'yxatdan o\'tish bekor qilindi.\n\nQayta boshlash uchun tugmani bosing:',
      startKeyboard,
    );
  }
}
