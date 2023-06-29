import styles from "./index.module.css";
import { CenterLayout } from "src/components/layouts/CenterLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const Error403Page = () => {
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
          I've done a fair bit of trespassing, but I don't think you're up for
          it sweet thing.
        </>
      ),
    },
  ];

  const image = images[Math.floor(Math.random() * images.length)];

  usePageMetadata(() => ({ ready: true, title: "403" }), []);

  return (
    <CenterLayout>
      <img className={styles.image} alt="403 error" src={image.image} />
      <div>{image.text}</div>
    </CenterLayout>
  );
};

const Error404Page = () => {
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

  usePageMetadata(() => ({ ready: true, title: "404" }), []);

  const image = images[Math.floor(Math.random() * images.length)];
  return (
    <CenterLayout>
      <img className={styles.image} alt="404 error" src={image.image} />
      <div>{image.text}</div>
    </CenterLayout>
  );
};

export { Error403Page, Error404Page };
