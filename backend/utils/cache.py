from flask_caching import Cache

cache = Cache()

def init_cache(app):

    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_REDIS_HOST"] = "localhost"
    app.config["CACHE_REDIS_PORT"] = 6379
    app.config["CACHE_REDIS_DB"] = 0
    app.config["CACHE_DEFAULT_TIMEOUT"] = 300  # 5 minutes

    

    cache.init_app(app)
