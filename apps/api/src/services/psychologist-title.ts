/**
 * A psychologist's name as it is printed on reports and e-mails: the name, then the professional title (gelar)
 * from their profile, e.g. "Dr. Haykal Hafizul Arifin" + "S.Psi., M.Si." -> "Dr. Haykal Hafizul Arifin, S.Psi., M.Si.".
 * Nothing is added when the title is empty or the name already carries it.
 */
export const withCredential = (name: string, credential: string | null | undefined): string => {
    const cleanName = name.trim();
    const title = (credential ?? '').trim().replace(/^[,\s]+/, '');
    if (!title) return cleanName;
    if (cleanName.toLowerCase().includes(title.toLowerCase())) return cleanName;
    return `${cleanName}, ${title}`;
};
