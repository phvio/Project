def twenty_twenty_six():
    """Come up with the most creative expression that evaluates to 2026
    using only numbers and the +, *, and - operators (or ** and % if you'd like).

    >>> twenty_twenty_six()
    2026
    """
    return (10 + 10) * 10 * 10 + 10 + 10  + 6


passphrase = 'REPLACE_THIS_WITH_PASSPHRASE'

def presem_survey(p):
    """
    You do not need to understand this code.
    >>> presem_survey(passphrase)
    'f65fb8fdaeda6d85eb3089dcdf7784836dde30e260c0ad31b9b2e533'
    """
    import hashlib
    return hashlib.sha224(p.encode('utf-8')).hexdigest()

