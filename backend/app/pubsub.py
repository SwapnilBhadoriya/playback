import json
from typing import AsyncIterator

import redis
import redis.asyncio as redis_asyncio

from app.config import settings

_sync_client = redis.Redis.from_url(settings.redis_url)


def _channel_name(video_id: str) -> str:
    return f"video-status:{video_id}"


def publish_status(video_id: str, current_stage: str, error_message: str | None = None) -> None:
    payload = json.dumps({"current_stage": current_stage, "error_message": error_message})
    _sync_client.publish(_channel_name(video_id), payload)


async def subscribe_status(video_id: str) -> AsyncIterator[dict]:
    client = redis_asyncio.Redis.from_url(settings.redis_url)
    pubsub = client.pubsub()
    await pubsub.subscribe(_channel_name(video_id))
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            yield json.loads(message["data"])
    finally:
        await pubsub.unsubscribe(_channel_name(video_id))
        await pubsub.close()
        await client.close()
