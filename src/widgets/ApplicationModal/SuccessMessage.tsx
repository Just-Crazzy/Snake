import cls from './ApplicationModal.module.scss';

type SuccessMessageProps = {
  onDone: () => void;
};

const SuccessMessage = ({ onDone }: SuccessMessageProps) => (
  <div className={cls.success}>
    <h2 className={cls.title}>We have received your application!</h2>
    <p className={cls.text}>
      We will process your request
      <br />
      and get in touch with you
    </p>
    <button type="button" className={cls.submit} onClick={onDone}>
      Done
    </button>
  </div>
);

export { SuccessMessage };
