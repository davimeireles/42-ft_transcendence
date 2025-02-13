from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

folder_path = MEDIA_ROOT
print(f'{folder_path}')
if not os.path.exists(folder_path):
    os.makedirs(folder_path)