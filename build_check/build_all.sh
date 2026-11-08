#!/bin/sh
# sorrrn — 전체 빌드 한 번에 (순서가 중요하다)
# 1) 예전 Safari 대응 변환  2) 셸(combined.html)에 splash·shop·about 동기화
# 3) 캐시 버스터  4) 상세·목록·계정 페이지 재생성
set -e
cd "$(dirname "$0")/.."
python3 build_check/legacy_safari.py
python3 build_combined/sync_splash.py
python3 build_combined/sync_shop.py
python3 build_combined/sync_about.py
python3 build_combined/stamp.py
python3 build_detail/product.py > /dev/null
python3 build_detail/gen.py > /dev/null
python3 build_detail/account.py > /dev/null
echo "build ok"
