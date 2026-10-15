#!/usr/bin/env python3
"""
solimp_viewer.py - Visualiza el contenido de ficheros .solimp de Solidar.

Un .solimp es un JSON comprimido con gzip (pako.gzip en el navegador).

Uso:
    python solimp_viewer.py proyecto.solimp                 # resumen de estructura
    python solimp_viewer.py proyecto.solimp --full          # JSON completo indentado
    python solimp_viewer.py proyecto.solimp --path a.b.0.c  # subárbol concreto
    python solimp_viewer.py proyecto.solimp --keys          # solo claves de primer nivel
    python solimp_viewer.py proyecto.solimp --extract out.json  # guarda JSON descomprimido
    python solimp_viewer.py proyecto.solimp --depth 4       # profundidad del resumen
"""
import argparse
import gzip
import json
import sys
from pathlib import Path


def load_solimp(path):
    """Lee y descomprime un .solimp. Tolera ficheros sin comprimir."""
    raw = Path(path).read_bytes()
    try:
        raw = gzip.decompress(raw)
    except gzip.BadGzipFile:
        print("Aviso: el fichero no está en formato gzip; se intenta leer como JSON plano.",
              file=sys.stderr)
    return json.loads(raw.decode("utf-8"))


def short(value, maxlen=60):
    s = json.dumps(value, ensure_ascii=False)
    return s if len(s) <= maxlen else s[: maxlen - 3] + "..."


def summarize(obj, name="raíz", depth=3, indent=0, max_items=8):
    """Imprime un resumen jerárquico: tipos, tamaños y valores escalares."""
    pad = "  " * indent
    if isinstance(obj, dict):
        print(f"{pad}{name}: dict ({len(obj)} claves)")
        if depth <= 0:
            return
        for i, (k, v) in enumerate(obj.items()):
            if i >= max_items * 4:
                print(f"{pad}  ... ({len(obj) - i} claves más)")
                break
            summarize(v, k, depth - 1, indent + 1, max_items)
    elif isinstance(obj, list):
        print(f"{pad}{name}: list ({len(obj)} elementos)")
        if depth <= 0 or not obj:
            return
        if all(not isinstance(x, (dict, list)) for x in obj):
            print(f"{pad}  [{', '.join(short(x, 20) for x in obj[:max_items])}"
                  f"{', ...' if len(obj) > max_items else ''}]")
            return
        for i, v in enumerate(obj[:3]):
            summarize(v, f"[{i}]", depth - 1, indent + 1, max_items)
        if len(obj) > 3:
            print(f"{pad}  ... ({len(obj) - 3} elementos más)")
    else:
        print(f"{pad}{name}: {type(obj).__name__} = {short(obj)}")


def get_path(obj, path):
    """Navega por una ruta tipo 'a.b.0.c' (los números indexan listas)."""
    for part in path.split("."):
        if isinstance(obj, list):
            obj = obj[int(part)]
        elif isinstance(obj, dict):
            obj = obj[part]
        else:
            raise KeyError(f"No se puede entrar en '{part}': el valor es escalar")
    return obj


def main():
    ap = argparse.ArgumentParser(description="Visualizador de ficheros .solimp de Solidar")
    ap.add_argument("fichero", help="Fichero .solimp")
    ap.add_argument("--full", action="store_true", help="Volcar el JSON completo")
    ap.add_argument("--keys", action="store_true", help="Mostrar solo claves de primer nivel")
    ap.add_argument("--path", help="Ruta a un subárbol, p.ej. 'edificio.0.consumo'")
    ap.add_argument("--extract", metavar="SALIDA", help="Guardar el JSON descomprimido")
    ap.add_argument("--depth", type=int, default=3, help="Profundidad del resumen (def. 3)")
    args = ap.parse_args()

    try:
        data = load_solimp(args.fichero)
    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as e:
        sys.exit(f"Error leyendo {args.fichero}: {e}")

    if args.extract:
        Path(args.extract).write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"JSON guardado en {args.extract}")
        return

    if args.path:
        try:
            data = get_path(data, args.path)
        except (KeyError, IndexError, ValueError) as e:
            sys.exit(f"Ruta no válida '{args.path}': {e!r}")

    if args.keys:
        if isinstance(data, dict):
            for k, v in data.items():
                n = f" ({len(v)})" if isinstance(v, (dict, list)) else ""
                print(f"{k}: {type(v).__name__}{n}")
        else:
            print(type(data).__name__)
    elif args.full:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        summarize(data, depth=args.depth)


if __name__ == "__main__":
    main()