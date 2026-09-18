import re
from typing import List, Dict

def parse_script_content(content: str) -> List[Dict]:
    """
    Parses Markdown or plain text into a structured list of sentences/paragraphs.
    Strips markdown formatting, numbered list prefixes, bullet points, headers.
    """
    lines = content.splitlines()
    sentences = []
    idx = 1

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue

        # Strip markdown headers: #, ##, ###
        cleaned = re.sub(r'^[#>\-\*]+\s*', '', cleaned)
        # Strip numbered prefixes like "1.", "1)", "(1)"
        cleaned = re.sub(r'^\(?\d+[\.\)]\s*', '', cleaned)
        cleaned = cleaned.strip()

        if not cleaned or len(cleaned) < 2:
            continue

        # Split into distinct sentences if paragraph contains multiple sentence terminators
        sub_sentences = re.split(r'(?<=[.?!])\s+(?=[A-ZÀ-Ỹ0-9])', cleaned)
        for s in sub_sentences:
            s_clean = s.strip()
            if s_clean:
                sentences.append({
                    "id": idx,
                    "text": s_clean
                })
                idx += 1

    return sentences
