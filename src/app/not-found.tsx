import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3">
          <span className="text-danger">Oops!</span> Sayfa bulunamadı
        </p>
        <p className="lead">Aradığınız sayfa mevcut değil.</p>
        <Link href="/" className="btn btn-primary">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
