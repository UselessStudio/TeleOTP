import logging
import os
from io import BytesIO

import qrcode

from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.WARN
)

app_tg = os.environ['TG_APP']
app_url = os.environ['WEBAPP_URL']


async def migrate(update: Update, context: ContextTypes.DEFAULT_TYPE, data: str):
    qr = qrcode.make(f"otpauth-migration://offline?data={data}")
    qr_bytes = BytesIO()
    qr_bytes.name = "image.png"
    qr.save(qr_bytes, "png")
    qr_bytes.seek(0)

    url = f"{app_tg}?startapp={data}"

    keyboard = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(
        text="Import accounts",
        url=url
    )]])
    await context.bot.send_photo(chat_id=update.effective_chat.id,
                                 photo=qr_bytes,
                                 reply_markup=keyboard,
                                 caption="Forward this message to another account or copy the link "
                                         "to migrate your TeleOTP accounts. "
                                         "Or import your accounts into Google Authenticator by scanning this QR-code.\n"
                                         f"{url}")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.web_app_data is not None:
        return await migrate(update, context, update.message.web_app_data.data)

    keyboard = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text="Open TeleOTP", web_app=WebAppInfo(url=app_url))]])
    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text="Welcome to TeleOTP! 👋\n"
                                        "I can help you protect your accounts with 2FA.\n"
                                        f"{app_tg}",
                                   disable_web_page_preview=False,
                                   reply_markup=keyboard)


if __name__ == '__main__':
    application = ApplicationBuilder().token(os.environ['TOKEN']).build()

    start_handler = MessageHandler(filters=filters.ALL, callback=start)
    application.add_handler(start_handler)

    application.run_polling()
