import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

export default function PostItem({ post }) {
  return (
    <tr>
      <td>{post.id}</td>
      <td>
        <Link to={`/community/${post.id}`} style={{ fontWeight: '500' }}>
          {post.title}
        </Link>
      </td>
      <td>{post.nickname}</td>
      <td>{post.viewCount}</td>
      <td>{post.likeCount}</td>
      <td>{formatDate(post.createdAt)}</td>
    </tr>
  );
}
