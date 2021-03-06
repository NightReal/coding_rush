def score(speed: int, accuracy: float, difficulty: int):
    cpm_norm = speed / 285
    acc_norm = accuracy / 100
    diff_norm = difficulty / 10

    base = cpm_norm * acc_norm
    if base <= 1:
        p = 0.9 * (diff_norm + 0.2) ** 3 + 0.1
    else:
        p = (diff_norm + 0.5) ** 0.3
    score_norm = base ** p

    score = round(score_norm * 100)
    return score
