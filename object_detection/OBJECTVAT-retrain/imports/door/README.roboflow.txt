
Door Detection - v15 2024-10-22 10:06am
==============================

This dataset was exported via roboflow.com on October 22, 2024 at 10:12 AM GMT

Roboflow is an end-to-end computer vision platform that helps you
* collaborate with your team on computer vision projects
* collect & organize images
* understand and search unstructured image data
* annotate, and create datasets
* export, train, and deploy computer vision models
* use active learning to improve your dataset over time

For state of the art Computer Vision training notebooks you can use with this dataset,
visit https://github.com/roboflow/notebooks

To find over 100k other datasets and pre-trained models, visit https://universe.roboflow.com

The dataset includes 1400 images.
Doorhandle are annotated in YOLOv8 format.

The following pre-processing was applied to each image:
* Auto-orientation of pixel data (with EXIF-orientation stripping)
* Resize to 640x640 (Stretch)

The following augmentation was applied to create 2 versions of each source image:

The following transformations were applied to the bounding boxes of each image:
* Random rotation of between -15 and +15 degrees
* Random brigthness adjustment of between -50 and +50 percent
* Random exposure adjustment of between -27 and +27 percent


