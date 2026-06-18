import Comments from "../home/Comments";
import InputComment from "../home/InputComment";
 
 
const Commentsss = ({ post}) => {
  
 
  return (
    <div style={{marginTop:'20'}} >
  <Comments post={post} />
   <InputComment/>
    </div>
  );
};
 export default Commentsss
 