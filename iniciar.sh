#!/bin/bash
cd "$(dirname "$0")"
echo "Abriendo Scout Predictor en http://localhost:8080"
open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null
python3 -m http.server 8080
