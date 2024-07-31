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


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup.from_button(InlineKeyboardButton(
        text="Open TeleOTP",
        web_app=WebAppInfo(url=f"{app_url}/")))

    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text="👋 Welcome to TeleOTP!\n"
                                        "I can help you protect your accounts with 2FA.\n"
                                        "Click the button below to get started!",
                                   reply_markup=keyboard)


if __name__ == '__main__':
    application = ApplicationBuilder().token(os.environ['TOKEN']).build()

    start_handler = MessageHandler(filters=filters.ALL, callback=start)
    application.add_handler(start_handler)

    application.run_polling()
