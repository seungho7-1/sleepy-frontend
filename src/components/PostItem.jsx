import { Link } from 'react-router-dom';

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
      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
    </tr>
  );
}
