exports.send_image = async (req, res, next) => {
  const {
    file: { Body, ContentType, ContentLength },
  } = req.aws;

  res.set("Content-Type", ContentType);
  res.set("Content-Length", ContentLength);
  res.send(Body);
};
