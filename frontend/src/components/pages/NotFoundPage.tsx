import "./NotFoundPage.css";

const images = [
  { image: "/404.1.png", text: <>ERROR 404</> },
  {
    image: "/404.2.png",
    text: (
      <>
        I believe you've encountered Error 404.
        <br /> Looks like you've had quite the adventure.
      </>
    ),
  },
  {
    image: "/404.3.png",
    text: (
      <>
        Error 404...
        <br />
        We seem to be missing something.
      </>
    ),
  },
  { image: "/404.4.png", text: <>Unexpected Error!</> },
  {
    image: "/404.5.png",
    text: <>I don't count Error 404 your average child's tea party.</>,
  },
];

const NotFoundPage = () => {
  const image = images[Math.floor(Math.random() * images.length)];
  return (
    <div className="NotFoundPage">
      <img src={image.image} />
      {image.text}
    </div>
  );
};

export { NotFoundPage };
