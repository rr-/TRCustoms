import "./ErrorPage.css";
import { useContext } from "react";
import { useEffect } from "react";
import { TitleContext } from "src/contexts/TitleContext";

const images = [
  {
    image: "/404.1.png",
    text: <>I'm Error 404 and I'll see you in your nightmares.</>,
  },
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
  { image: "/404.4.png", text: <>Error 404!!</> },
  {
    image: "/404.5.png",
    text: <>I don't count Error 404 your average child's tea party.</>,
  },
];

const Error404Page = () => {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("404");
  }, [setTitle]);

  const image = images[Math.floor(Math.random() * images.length)];
  return (
    <div className="ErrorPage">
      <img alt="404 error" src={image.image} />
      {image.text}
    </div>
  );
};

export { Error404Page };
