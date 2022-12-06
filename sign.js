/* eslint-disable */

export function signV1(obj) {
    function o(e, t) {
        var n = (65535 & e) + (65535 & t);
        return (e >> 16) + (t >> 16) + (n >> 16) << 16 | 65535 & n
    }
    function i(e, t, n, r, i, a) {
        return o((a = o(o(t, e), o(r, a))) << (i = i) | a >>> 32 - i, n)
    }
    function a(e, t, n, r, o, a, s) {
        return i(t & n | ~t & r, e, t, o, a, s)
    }
    function s(e, t, n, r, o, a, s) {
        return i(t & r | n & ~r, e, t, o, a, s)
    }
    function u(e, t, n, r, o, a, s) {
        return i(t ^ n ^ r, e, t, o, a, s)
    }
    function l(e, t, n, r, o, a, s) {
        return i(n ^ (t | ~r), e, t, o, a, s)
    }
    function c(e, t) {
        var n, r, i, c;
        e[t >> 5] |= 128 << t % 32,
        e[14 + (t + 64 >>> 9 << 4)] = t;
        for (var f = 1732584193, p = -271733879, d = -1732584194, h = 271733878, v = 0; v < e.length; v += 16)
            f = a(n = f, r = p, i = d, c = h, e[v], 7, -680876936),
            h = a(h, f, p, d, e[v + 1], 12, -389564586),
            d = a(d, h, f, p, e[v + 2], 17, 606105819),
            p = a(p, d, h, f, e[v + 3], 22, -1044525330),
            f = a(f, p, d, h, e[v + 4], 7, -176418897),
            h = a(h, f, p, d, e[v + 5], 12, 1200080426),
            d = a(d, h, f, p, e[v + 6], 17, -1473231341),
            p = a(p, d, h, f, e[v + 7], 22, -45705983),
            f = a(f, p, d, h, e[v + 8], 7, 1770035416),
            h = a(h, f, p, d, e[v + 9], 12, -1958414417),
            d = a(d, h, f, p, e[v + 10], 17, -42063),
            p = a(p, d, h, f, e[v + 11], 22, -1990404162),
            f = a(f, p, d, h, e[v + 12], 7, 1804603682),
            h = a(h, f, p, d, e[v + 13], 12, -40341101),
            d = a(d, h, f, p, e[v + 14], 17, -1502002290),
            f = s(f, p = a(p, d, h, f, e[v + 15], 22, 1236535329), d, h, e[v + 1], 5, -165796510),
            h = s(h, f, p, d, e[v + 6], 9, -1069501632),
            d = s(d, h, f, p, e[v + 11], 14, 643717713),
            p = s(p, d, h, f, e[v], 20, -373897302),
            f = s(f, p, d, h, e[v + 5], 5, -701558691),
            h = s(h, f, p, d, e[v + 10], 9, 38016083),
            d = s(d, h, f, p, e[v + 15], 14, -660478335),
            p = s(p, d, h, f, e[v + 4], 20, -405537848),
            f = s(f, p, d, h, e[v + 9], 5, 568446438),
            h = s(h, f, p, d, e[v + 14], 9, -1019803690),
            d = s(d, h, f, p, e[v + 3], 14, -187363961),
            p = s(p, d, h, f, e[v + 8], 20, 1163531501),
            f = s(f, p, d, h, e[v + 13], 5, -1444681467),
            h = s(h, f, p, d, e[v + 2], 9, -51403784),
            d = s(d, h, f, p, e[v + 7], 14, 1735328473),
            f = u(f, p = s(p, d, h, f, e[v + 12], 20, -1926607734), d, h, e[v + 5], 4, -378558),
            h = u(h, f, p, d, e[v + 8], 11, -2022574463),
            d = u(d, h, f, p, e[v + 11], 16, 1839030562),
            p = u(p, d, h, f, e[v + 14], 23, -35309556),
            f = u(f, p, d, h, e[v + 1], 4, -1530992060),
            h = u(h, f, p, d, e[v + 4], 11, 1272893353),
            d = u(d, h, f, p, e[v + 7], 16, -155497632),
            p = u(p, d, h, f, e[v + 10], 23, -1094730640),
            f = u(f, p, d, h, e[v + 13], 4, 681279174),
            h = u(h, f, p, d, e[v], 11, -358537222),
            d = u(d, h, f, p, e[v + 3], 16, -722521979),
            p = u(p, d, h, f, e[v + 6], 23, 76029189),
            f = u(f, p, d, h, e[v + 9], 4, -640364487),
            h = u(h, f, p, d, e[v + 12], 11, -421815835),
            d = u(d, h, f, p, e[v + 15], 16, 530742520),
            f = l(f, p = u(p, d, h, f, e[v + 2], 23, -995338651), d, h, e[v], 6, -198630844),
            h = l(h, f, p, d, e[v + 7], 10, 1126891415),
            d = l(d, h, f, p, e[v + 14], 15, -1416354905),
            p = l(p, d, h, f, e[v + 5], 21, -57434055),
            f = l(f, p, d, h, e[v + 12], 6, 1700485571),
            h = l(h, f, p, d, e[v + 3], 10, -1894986606),
            d = l(d, h, f, p, e[v + 10], 15, -1051523),
            p = l(p, d, h, f, e[v + 1], 21, -2054922799),
            f = l(f, p, d, h, e[v + 8], 6, 1873313359),
            h = l(h, f, p, d, e[v + 15], 10, -30611744),
            d = l(d, h, f, p, e[v + 6], 15, -1560198380),
            p = l(p, d, h, f, e[v + 13], 21, 1309151649),
            f = l(f, p, d, h, e[v + 4], 6, -145523070),
            h = l(h, f, p, d, e[v + 11], 10, -1120210379),
            d = l(d, h, f, p, e[v + 2], 15, 718787259),
            p = l(p, d, h, f, e[v + 9], 21, -343485551),
            f = o(f, n),
            p = o(p, r),
            d = o(d, i),
            h = o(h, c);
        return [f, p, d, h]
    }
    function f(e) {
        for (var t = "", n = 32 * e.length, r = 0; r < n; r += 8)
            t += String.fromCharCode(e[r >> 5] >>> r % 32 & 255);
        return t
    }
    function p(e) {
        var t = [];
        for (t[(e.length >> 2) - 1] = void 0,
        r = 0; r < t.length; r += 1)
            t[r] = 0;
        for (var n = 8 * e.length, r = 0; r < n; r += 8)
            t[r >> 5] |= (255 & e.charCodeAt(r / 8)) << r % 32;
        return t
    }
    function d(e) {
        for (var t, n = "0123456789abcdef", r = "", o = 0; o < e.length; o += 1)
            t = e.charCodeAt(o),
            r += n.charAt(t >>> 4 & 15) + n.charAt(15 & t);
        return r
    }
    function h(e) {
        return unescape(encodeURIComponent(e))
    }
    function v(e) {
        return f(c(p(e = h(e)), 8 * e.length))
    }
    function g(e, t) {
        return function(e, t) {
            var n, r = p(e), o = [], i = [];
            for (o[15] = i[15] = void 0,
            16 < r.length && (r = c(r, 8 * e.length)),
            n = 0; n < 16; n += 1)
                o[n] = 909522486 ^ r[n],
                i[n] = 1549556828 ^ r[n];
            return t = c(o.concat(p(t)), 512 + 8 * t.length),
            f(c(i.concat(t), 640))
        }(h(e), h(t))
    }
    function y(e, t, n) {
        return t ? n ? g(t, e) : d(g(t, e)) : n ? v(e) : d(v(e))
    }

    function ss(e, t, n) {
        if (!t)
            return "";
        var r, i, a = "string" == typeof e ? e : JSON.stringify(e);
        return a = e ? (r = a,
        i = encodeURIComponent(r).match(/%[89ABab]/g),
        r.length + (i ? i.length : 0)) : 0,
        "v1" === t ? (r = n,
        i = a,
        y("" + r + i + "HQ31X02e")) : "v2" === t ? (n = n,
        a = a,
        y("90A599D6" + n.split("").reverse().join("") + a)) : ""
    }

    return ss(obj, 'v1', 'https://h5.tu.qq.com');
}
