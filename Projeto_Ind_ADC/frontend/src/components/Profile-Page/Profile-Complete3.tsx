function ProfileComplete3() {
  return (
    <>
      {" "}
      <div
        className="d-flex align-items-center bg-white rounded-4 shadow-sm p-2 px-3 gap-3"
        style={{ maxWidth: 360 }}
      >
        <img
          className="rounded-circle flex-shrink-0"
          style={{ width: 44, height: 44, objectFit: "cover" }}
        />

        <span className="flex-grow-1 fw-medium text-truncate">Nome</span>

        <button
          type="button"
          className="btn btn-success rounded-circle d-flex align-items-center justify-content-center p-0"
          style={{ width: 34, height: 34 }}
          aria-label="Accept"
        >
          <i className="bi bi-check-lg"></i>
        </button>

        <button
          type="button"
          className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center p-0"
          style={{ width: 34, height: 34 }}
          aria-label="Reject"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </>
  );
}

export default ProfileComplete3;
