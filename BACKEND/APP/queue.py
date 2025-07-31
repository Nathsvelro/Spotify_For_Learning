
import os
from redis import Redis
from rq import Queue
from .config import settings

redis_conn = Redis.from_url(settings.redis_url)
generation_queue = Queue("lesson-generation", connection=redis_conn)
