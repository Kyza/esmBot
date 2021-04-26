#include <Magick++.h>
#include <napi.h>

#include <list>

using namespace std;
using namespace Magick;

Napi::Value CaptionTwo(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  try {
    Napi::Object obj = info[0].As<Napi::Object>();
    string path = obj.Get("path").As<Napi::String>().Utf8Value();
    string caption = obj.Get("caption").As<Napi::String>().Utf8Value();
    string type = obj.Get("type").As<Napi::String>().Utf8Value();
    int delay =
        obj.Has("delay") ? obj.Get("delay").As<Napi::Number>().Int32Value() : 0;

    Blob blob;

    list<Image> frames;
    list<Image> coalesced;
    list<Image> captioned;
    Blob caption_blob;
    readImages(&frames, path);

    size_t width = frames.front().baseColumns();
    string query(to_string(width - ((width / 25) * 2)) + "x");
    Image caption_image(Geometry(query), Color("white"));
    caption_image.fillColor("black");
    caption_image.font("Helvetica Neue");
    caption_image.fontPointsize(width / 17);
    caption_image.read("pango:" + caption);
    caption_image.extent(Geometry(width, caption_image.rows() + (width / 25)),
                         Magick::CenterGravity);

    coalesceImages(&coalesced, frames.begin(), frames.end());

    for (Image &image : coalesced) {
      Image appended;
      list<Image> images;
      image.backgroundColor("white");
      images.push_back(image);
      images.push_back(caption_image);
      appendImages(&appended, images.begin(), images.end(), true);
      appended.repage();
      appended.magick(type);
      appended.animationDelay(delay == 0 ? image.animationDelay() : delay);
      captioned.push_back(appended);
    }

    optimizeTransparency(captioned.begin(), captioned.end());

    if (type == "gif") {
      for (Image &image : captioned) {
        image.quantizeDither(false);
        image.quantize();
      }
    }

    writeImages(captioned.begin(), captioned.end(), &blob);

    Napi::Object result = Napi::Object::New(env);
    result.Set("data", Napi::Buffer<char>::Copy(env, (char *)blob.data(),
                                                blob.length()));
    result.Set("type", type);
    return result;
  } catch (std::exception const &err) {
    throw Napi::Error::New(env, err.what());
  }
}