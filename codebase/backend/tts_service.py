import io
from gtts import gTTS

def generate_vietnamese_audio(text: str, slow: bool = False) -> io.BytesIO:
    """
    Generates standard Vietnamese speech audio (MP3) from text using gTTS.
    Guarantees authentic Vietnamese pronunciation with accurate accents and tone.
    """
    clean_text = text.strip()
    if not clean_text:
        clean_text = "Không có nội dung để đọc."

    # Using 'vi' for Vietnamese language
    tts = gTTS(text=clean_text, lang='vi', slow=slow)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp

def generate_comparison_audio(original: str, suggested: str) -> io.BytesIO:
    """
    Generates comparison audio in Vietnamese:
    'Trước khi sửa: [original]... Sau khi sửa: [suggested]'
    """
    combined = f"Trước khi sửa: {original.strip()}. Sau khi sửa: {suggested.strip()}."
    return generate_vietnamese_audio(combined)
