exports.formatDate = (date) => {
  const formattedDate = new Date(date);

  const day = String(formattedDate.getDate()).padStart(2, "0");
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const year = String(formattedDate.getFullYear()).slice(-2);

  const formatted = `${day}/${month}/${year}`;

  return formatted;
};
