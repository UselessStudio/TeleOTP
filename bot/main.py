import logging
import os
import urllib.parse
from io import BytesIO

import qrcode

from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, InlineKeyboardMarkup, \
    InlineKeyboardButton, ReplyKeyboardRemove
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters, CommandHandler

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.WARN
)

app_tg = os.environ['TG_APP']
app_url = os.environ['WEBAPP_URL']


async def migrate(update: Update, context: ContextTypes.DEFAULT_TYPE):
    data = update.message.web_app_data.data

    urlencoded = urllib.parse.quote_plus(data)

    qr = qrcode.make(f"otpauth-migration://offline?data={urlencoded}")
    qr_bytes = BytesIO()
    qr_bytes.name = "image.png"
    qr.save(qr_bytes, "png")
    qr_bytes.seek(0)

    data = data.replace("+", "-").replace("/", "_").replace("=", "")

    url = f"{app_tg}?startapp={data}"

    await context.bot.send_photo(chat_id=update.effective_chat.id,
                                 photo=qr_bytes,
                                 reply_markup=ReplyKeyboardRemove(),
                                 caption="✅ Done!\n"
                                         "You can import your accounts into Google Authenticator or TeleOTP "
                                         "by scanning the QR code.\n"
                                         "If you want to transfer your accounts to another Telegram user, "
                                         f"copy the following link:\n{url}")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup.from_button(InlineKeyboardButton(
        text="Open TeleOTP",
        web_app=WebAppInfo(url=f"{app_url}/")))

    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text="👋 Welcome to TeleOTP!\n"
                                        "I can help you protect your accounts with 2FA.\n"
                                        "Click the button below to get started!",
                                   reply_markup=keyboard)


async def migrate_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = ReplyKeyboardMarkup.from_button(
        button=KeyboardButton(text="Export accounts", web_app=WebAppInfo(url=f"{app_url}?export")),
        resize_keyboard=True)

    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text="📲 To export your accounts, click the keyboard button.",
                                   reply_markup=keyboard)


if __name__ == '__main__':
    application = ApplicationBuilder().token(os.environ['TOKEN']).build()

    migrate_handler = CommandHandler("start", migrate_button, filters=filters.Regex('export'))
    application.add_handler(migrate_handler)

    data_handler = MessageHandler(filters=filters.StatusUpdate.WEB_APP_DATA, callback=migrate)
    application.add_handler(data_handler)

    start_handler = MessageHandler(filters=filters.ALL, callback=start)
    application.add_handler(start_handler)

    application.run_polling()
