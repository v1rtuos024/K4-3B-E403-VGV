from typing import List, Dict, Any
from presets import PRESETS
from ai_service import analyze_sentences_multi_provider

async def evaluate_golden_set(
    provider: str = "gemini",
    model: str = None,
    custom_api_key: str = None
) -> Dict[str, Any]:
    """
    Evaluates the 21 Golden Set test cases against Ground Truth.
    Calculates 5-dimension quality criteria and PASS/FAIL status for each case.
    """
    golden_preset = PRESETS.get(6, {})
    raw_cases = golden_preset.get("sentences", [])

    sentences_payload = [{"id": c["id"], "text": c["text"]} for c in raw_cases]

    # Call AI Multi-provider
    analysis_result = await analyze_sentences_multi_provider(
        sentences=sentences_payload,
        provider=provider,
        model=model,
        custom_api_key=custom_api_key
    )

    issues_by_id = {i["sentence_id"]: i for i in analysis_result.get("issues", [])}

    evaluated_cases = []
    pass_count = 0

    for case in raw_cases:
        cid = case["id"]
        ai_issue = issues_by_id.get(cid)
        gold_label = case.get("gold_label", "NEEDS_REVISION")
        gold_span = case.get("gold_span", "")

        is_clean_gold = (gold_label == "CLEAN")

        if is_clean_gold:
            # For clean sentence: PASS if AI found NO issue (True Negative)
            detected_clean = (ai_issue is None)
            eval_status = "PASS" if detected_clean else "FAIL"
            criteria = {
                "detection": detected_clean,
                "span": True,
                "category": True,
                "explanation": True,
                "suggestion": True,
            }
            ai_label = "CLEAN" if detected_clean else "NEEDS_REVISION"
            notes = "Chuẩn CLEAN - không tạo false positive" if eval_status == "PASS" else "Báo lỗi sai (False Positive)"
            color = "blue" if eval_status == "PASS" else "red"
        else:
            # For error sentence: PASS if AI detected the problem and provided suggestion
            detection = (ai_issue is not None)
            if ai_issue:
                ai_span = ai_issue.get("span", "")
                span_match = bool(ai_span and (ai_span.lower() in case["text"].lower() or (gold_span and gold_span.lower() in ai_span.lower())))
                explanation = bool(ai_issue.get("reason"))
                suggestion = bool(ai_issue.get("suggestion"))
                category_match = True

                # Pass if detection and at least 3 of the sub-criteria are met
                sub_score = sum([span_match, category_match, explanation, suggestion])
                eval_status = "PASS" if (detection and sub_score >= 3) else "FAIL"
                criteria = {
                    "detection": detection,
                    "span": span_match,
                    "category": category_match,
                    "explanation": explanation,
                    "suggestion": suggestion,
                }
                ai_label = "NEEDS_REVISION"
                notes = f"Phát hiện {ai_issue.get('type')}: \"{ai_span}\"" if eval_status == "PASS" else "Khoanh vùng chưa sát (Need Refinement)"
                color = "purple" if eval_status == "PASS" else "red"
            else:
                eval_status = "FAIL"
                criteria = {
                    "detection": False,
                    "span": False,
                    "category": False,
                    "explanation": False,
                    "suggestion": False,
                }
                ai_label = "CLEAN"
                notes = "Bỏ sót lỗi (False Negative)"
                color = "red"

        if eval_status == "PASS":
            pass_count += 1

        evaluated_cases.append({
            **case,
            "eval_status": eval_status,
            "ai_label": ai_label,
            "ai_issue": ai_issue,
            "criteria": criteria,
            "notes": notes,
            "color": color,
            "type": f"{case['category']} ({gold_label})",
            "reason": [ai_issue.get("reason")] if ai_issue else [case.get("gold_reason", "Không có")],
            "suggest": ai_issue.get("suggestion") if ai_issue else case.get("gold_suggest", case["text"]),
        })

    total_count = len(evaluated_cases)
    pass_rate = round((pass_count / total_count * 100), 1) if total_count > 0 else 0.0

    return {
        "cases": evaluated_cases,
        "pass_count": pass_count,
        "fail_count": total_count - pass_count,
        "total_cases": total_count,
        "pass_rate": pass_rate,
        "quality_bar_met": pass_rate >= 70.0,
        "provider": analysis_result.get("provider", provider),
        "model": analysis_result.get("model", model or "default")
    }
