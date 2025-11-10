import { Link, useLocation } from "react-router-dom";
interface Iprops {
  message?: string;
  status?: number;
}
const ErrorHandler = ({ message = "Server Error", status = 500 }: Iprops) => {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col items-center justify-center  space-y-4 my-20">
      <img
        src="https://tse4.mm.bing.net/th/id/OIP.8FS1ZtnQGqWZyFrvbWNfZAHaHa?r=0&pid=ImgDet&w=184&h=184&c=7&dpr=1.3&o=7&rm=3"
        alt="Error"
        className="rounded-full"
      />
      <h2>
        {status} - {message}
      </h2>
      <p>
        Oops something went wrong. Try to refresh this page or feel free to
        contact us if the problem presists.
      </p>
      <div className="flex flex-row space-x-4 justify-center ">
        <Link to="/" className="h-auto w-auto bg-cyan-400 p-5 rounded-2xl">
          Go back to Home
        </Link>
        <Link
          to={pathname}
          reloadDocument
          className="h-auto w-auto bg-cyan-400 p-5 rounded-2xl"
        >
          Refresh
        </Link>
      </div>
    </div>
  );
};

export default ErrorHandler;
