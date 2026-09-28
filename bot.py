# -*- coding: utf-8 -*-
"""
Telegram Bot для запуска Mini App "Retro Casino PSP"
Поддерживает работу с aiogram 3.x и встроенный веб-сервер для локального тестирования.
"""

import os
import sys
import asyncio
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Установка логирования
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Токен бота (замените на свой токен от @BotFather или передайте через переменную окружения)
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

# URL вашего развернутого Mini App (например, на GitHub Pages, Vercel, Render или ngrok)
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain-or-github-pages.io")


def run_local_server(port=8000):
    """Локальный веб-сервер для запуска и проверки игры в браузере"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"\n=======================================================")
    print(f"🎮 Retro Casino PSP успешно запущено локально!")
    print(f"👉 Откройте в браузере: http://localhost:{port}")
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
        user_name = message.from_user.first_name if message.from_user else "Игрок"

        # Кнопка для открытия WebApp прямо внутри Telegram
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🎰 Играть в Retro Casino",
                        web_app=WebAppInfo(url=WEBAPP_URL)
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="👑 Таблица лидеров КПД",
                        web_app=WebAppInfo(url=WEBAPP_URL)
                    )
                ]
            ]
        )

        caption = (
            f"👋 Здорово, <b>{user_name}</b>!\n\n"
            f"Добро пожаловать в <b>Retro Casino PSP</b> в стиле 2D Pixel!\n\n"
            f"🃏 <b>Блэкджек (21 очко)</b> с виртуальным дилером\n"
            f"🎲 <b>Европейская Рулетка</b> со вращающимся колесом\n"
            f"👥 <b>Столы и комнаты</b> как в игре КПД\n"
            f"🛍 <b>Мемные костюмы:</b> Зубенко М.П., Иван Золо, Саша Белый и др.\n"
            f"🪙 <b>300 стартовых фишек</b> каждому новому игроку!\n\n"
            f"Жми кнопку ниже, чтобы зайти в казино!"
        )

        await message.answer(caption, parse_mode="HTML", reply_markup=keyboard)

        # Настраиваем главную кнопку меню слева от ввода сообщения
        try:
            await bot.set_chat_menu_button(
                chat_id=message.chat.id,
                menu_button=MenuButtonWebApp(
                    text="🎰 Казино",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            )
        except Exception as e:
            logger.warning(f"Не удалось настроить Chat Menu Button: {e}")

    logger.info("Запуск Telegram-бота...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
        run_local_server(port)
    else:
        # Если передан аргумент --bot или по умолчанию проверяем токен
        if BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN":
            asyncio.run(start_telegram_bot())
        else:
            # Если токен не настроен, по умолчанию запускаем удобный локальный веб-сервер
            run_local_server(8000)
