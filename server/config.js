var _ENV = 'prod';

module.exports = {
	_ENV: _ENV,
	_DEBUG: (_ENV == 'dev' ? true : false),
	_PORT: 8000,
    _TWITTER_TOKEN: 'ww75gdgtikRtSj6Jf3UOAw7h7',
    _TWITTER_SECRET: '1bfprRh2yWRS6pbjIBeNFwgBriaqiwqiJuXcxJD4ynEPvhPQb1',
    _TWITTER_UTOKEN: '33702319-UlOhILbcLxN1y7zjKnXZbV6mwwk039GGKoNk1K7aR',
    _TWITTER_USECRET: 'hLemxP9AcCCej9oRK47znIpWLHc3RkJ0P5nMzkLTe5XoU',
    _INSTAGRAM_TOKEN: (_ENV == 'dev' ? "8dcec452c6c84d418338d168e835fb9e" : "b6d0636c8ab94626a2c34b038be33856"),
    _INSTAGRAM_SECRET: (_ENV == 'dev' ? "0c5ff82b307b4deb8b4ab8b899e1b5f4" : "1aa6c30ab46745f8a1f27f9717dee444"),
    _INSTAGRAM_CALLBACK: (_ENV == 'dev' ? "http://85.183.35.106:8080/subscribe" : "http://eu-fr-1.ente.io:8080/subscribe"),
    _REDIS_PASSWORD: "5l2g3d987dfQ7Q7290Zw"
}