const { formatDate } = require("../helpers/formatDate");

exports.formart_date = (req, res, next) => {
  const {data} = req.body;
  const newData = [];

  for (const key in data) {
    const { create_at } = data[key];
    data[key].create_at = formatDate(create_at);
  }

  res.send(data);
};
