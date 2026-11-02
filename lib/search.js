const collectSearchableText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(collectSearchableText).join(' ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key.toLowerCase() !== 'password')
      .map(([, nestedValue]) => collectSearchableText(nestedValue))
      .join(' ');
  }
  return String(value);
};

export const filterBySearch = (items, searchTerm) => {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  if (!normalizedSearchTerm) return items;

  return items.filter((item) =>
    collectSearchableText(item).toLocaleLowerCase().includes(normalizedSearchTerm)
  );
};
