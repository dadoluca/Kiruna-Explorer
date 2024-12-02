import { useRouteError } from 'react-router-dom';

function ErrorPage() {

  let title = 'An error occurred!';
  let message = 'Something went wrong!';

  return (
    <div style={{ textAlign: 'center' }}>
        <h1>{title}</h1>
        <h4>{message}</h4>
    </div>
    
  );
}

export default ErrorPage;