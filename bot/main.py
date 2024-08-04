import logging
import os

import yaml
from telegram import Update, WebAppInfo, InlineKeyboardMarkup, \
    InlineKeyboardButton
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.WARN
)

app_tg = os.environ['TG_APP']
app_url = os.environ['WEBAPP_URL']

translations = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = update.effective_user.language_code

    def l(code):
        if lang in translations and code in translations[lang]:
            return translations[lang][code]

        return translations["en"][code]

    keyboard = InlineKeyboardMarkup.from_button(InlineKeyboardButton(
        text=l("ButtonText"),
        web_app=WebAppInfo(url=f"{app_url}/")))

    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text=f"{l('Welcome')}\n"
                                        f"{l('ICanHelp')}\n"
                                        f"{l('ClickButton')}",
                                   reply_markup=keyboard)


if __name__ == '__main__':
    for lang in os.listdir("lang"):
        code = lang.replace(".yml", "")
        with open(os.path.join("lang", lang), encoding="utf-8") as f:
            translations[code] = yaml.safe_load(f)

    application = ApplicationBuilder().token(os.environ['TOKEN']).build()

    start_handler = MessageHandler(filters=filters.ALL, callback=start)
    application.add_handler(start_handler)

    application.run_polling()
