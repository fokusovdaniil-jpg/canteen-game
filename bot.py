# -*- coding: utf-8 -*-
"""
Telegram Bot для запуска Mini App "LIT CASINO" (Energy Edition)
Поддерживает работу с aiogram 3.x и встроенный веб-сервер для локального тестирования.
"""

import os
import sys
import asyncio
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain-or-github-pages.io")


def run_local_server(port=8000):
    """Локальный веб-сервер для запуска и проверки игры в браузере"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"\n=======================================================")
    print(f"🔥 LIT CASINO (Energy Edition) успешно запущено!")
    print(f"👉 Откройте в браузере: http://localhost:{port}")
    print(f"⚡ PIN администратора: 7777")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")


async def start_telegram_bot():
    """Запуск Telegram бота через aiogram 3"""
    try:
        from aiogram import Bot, Dispatcher, types
        from aiogram.filters import CommandStart
        from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp
    except ImportError:
        logger.error(
            "aiogram не установлен. Установите зависимости: pip install -r requirements.txt\n"
            "Или запустите локальный сервер: python bot.py --serve"
        )
        return

    if BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        print("\n⚠️ ВНИМАНИЕ: Укажите токен бота в BOT_TOKEN или переменной окружения BOT_TOKEN.")
        print("Для локальной игры без бота запустите: py bot.py --serve\n")
        return

    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()

    @dp.message(CommandStart())
    async def cmd_start(message: types.Message):
        user_name = message.from_user.first_name if message.from_user else "Капер"

        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="⚡ Играть в LIT CASINO",
                        web_app=WebAppInfo(url=WEBAPP_URL)
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="🏆 Рейтинг игроков КПД",
                        web_app=WebAppInfo(url=WEBAPP_URL)
                    )
                ]
            ]
        )

        caption = (
            f"⚡ Здорово, <b>{user_name}</b>!\n\n"
            f"Добро пожаловать в <b>LIT CASINO</b> — премиальное онлайн-казино в стиле Lit Energy!\n\n"
            f"🃏 <b>Блэкджек (21 очко)</b> с виртуальным дилером\n"
            f"🎲 <b>Европейская Рулетка</b> с реалистичным колесом\n"
            f"👥 <b>Столы и комнаты</b> как в игре КПД\n"
            f"🛍 <b>Мемные скины:</b> Зубенко М.П., Иван Золо, Саша Белый, Lit Edition\n"
            f"🪙 <b>300 стартовых фишек</b> каждому новичку!\n\n"
            f"Жми кнопку ниже, чтобы войти в игру!"
        )

        await message.answer(caption, parse_mode="HTML", reply_markup=keyboard)

        try:
            await bot.set_chat_menu_button(
                chat_id=message.chat.id,
                menu_button=MenuButtonWebApp(
                    text="⚡ LIT CASINO",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            )
        except Exception as e:
            logger.warning(f"Не удалось настроить Chat Menu Button: {e}")

    logger.info("Запуск Telegram-бота LIT CASINO...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
        run_local_server(port)
    else:
        if BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN":
            asyncio.run(start_telegram_bot())
        else:
            run_local_server(8000)
