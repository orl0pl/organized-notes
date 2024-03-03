export function Modal({
  children,
  dissmissOnBackgroundClick,
  hideModal,
}: {
  children: React.ReactNode;
  dissmissOnBackgroundClick?: boolean;
  hideModal: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={dissmissOnBackgroundClick ? hideModal : undefined}
    >
      <div className="modal-container">{children}</div>
    </div>
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="modal-actions">{children}</div>;
}
