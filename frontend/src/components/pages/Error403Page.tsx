import "./ErrorPage.css";
import { useContext } from "react";
import { useEffect } from "react";
import { TitleContext } from "src/contexts/TitleContext";

const images = [
  {
    image: "/403.1.png",
    text: (
      <>
        Error 403...!?
        <br />
        Uh-oh! It's forbidden to be here!
      </>
    ),
  },
  {
    image: "/403.2.png",
    text: <>ERROR 403: You can't be here!</>,
  },
  {
    image: "/403.3.png",
    text: (
      <>
        Rodents, I wouldn't wonder... BIG rodents.
        <br />
        Error 403 - Resource Forbidden
      </>
    ),
  },
  {
    image: "/403.4.png",
    text: (
      <>
        Hands where I can see them, amigo... or should I say...
        <br />
        ERROR 403!
      </>
    ),
  },
  {
    image: "/403.5.png",
    text: (
      <>
        Error 403.
        <br />
        I've done a fair bit of trespassing, but I don't think you're up for it
        sweet thing.
      </>
    ),
  },
];

const Error403Page = () => {
  const image = images[Math.floor(Math.random() * images.length)];
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("403");
  }, [setTitle]);

  return (
    <div className="ErrorPage">
      <img alt="403 error" src={image.image} />
      {image.text}
    </div>
  );
};

export { Error403Page };
