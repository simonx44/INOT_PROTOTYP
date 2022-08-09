import { FC, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import ImageObjectDetector from "./ImageObjectDetector";

interface IProps {}

function importAll(r: any) {
  let images = {};
  r.keys().map((item: any) => {
    console.log(item);
    //@ts-ignore
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

const Gallery: FC<IProps> = (props) => {
  const [detailView, updateDetailView] = useState({
    isOpen: false,
    image: undefined,
  });
  const images = useMemo(() => {
    const imagesLoaded: Record<string, any> = importAll(
      require.context("../images", false, /.jpg|.png|.jpeg/)
    );
    return imagesLoaded;
  }, []);

  const footer = (image: any) => (
    <Button
      className="w-full p-button-outlined"
      label="Determine the passenger type"
      icon="pi pi-eye"
      onClick={() => updateDetailView({ isOpen: true, image: image })}
    />
  );

  console.log(Object.keys(images).map((el) => el));

  return (
    <div>
      <Dialog
        header={`${detailView.image}`}
        visible={detailView.isOpen}
        style={{ width: "90vw" }}
        modal
        onHide={() => updateDetailView({ isOpen: false, image: undefined })}
      >
        <ImageObjectDetector img={detailView.image} />
      </Dialog>

      <div className="grid">
        {Object.keys(images).map((img) => {
          const imagePath = images[img] ?? "";
          return (
            <div className="col-12 md:col-6 lg:col-4 xl:col-3" key={img}>
              <Card
                className="customCard h-full"
                title={`Image: ${img}`}
                subTitle=""
                footer={footer(imagePath)}
                header={() => (
                  <img alt={img} src={imagePath} className="customCard--img" />
                )}
              ></Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
