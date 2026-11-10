const IMAGE_SELECTOR = 'img, svg';

const preventImageDrag = (event: DragEvent) => {
  const { target } = event;

  if (!(target instanceof Element)) return;

  const isImage = target.closest(IMAGE_SELECTOR) !== null;
  const isImageLink = Boolean(target.closest('a')?.querySelector(IMAGE_SELECTOR));

  if (isImage || isImageLink) event.preventDefault();
};

export { preventImageDrag };
