type Props = {
    children: React.ReactNode;
  };
  
  const Button = ({ children }: Props) => {
    return (
      <button className="btn btn-success">
        {children}
      </button>
    );
  };
  
  export default Button;