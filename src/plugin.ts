import type { Plugin } from "unified";
import * as mdast from "mdast";
import { visit } from "unist-util-visit";
import { mdastToDocx, Opts, ImageDataMap } from "./transformer";

export type Options = Opts;

const plugin: Plugin<[Options?]> = function (opts = {}) {
  let images: ImageDataMap = {};

  this.Compiler = (node) => {
    return mdastToDocx(node as any, opts, images);
  };

  return async (node) => {
    const imageResolver = opts.imageResolver;
    if (!imageResolver) {
      throw new Error("options.imageResolver is not defined.");
    }
    const imageList: mdast.Image[] = [];
    visit(node, "image", (node) => {
      imageList.push(node);
    });
    const imageDatas = await Promise.all(
      imageList.map(({ url }) => imageResolver(url))
    );
    images = imageList.reduce((acc, img, i) => {
      acc[img.url] = imageDatas[i];
      return acc;
    }, {} as ImageDataMap);
    return node;
  };
};
export default plugin;
