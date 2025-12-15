
from django.db.models import Count, Q, Prefetch
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Post, PostLike
from .serializers import PostSerializer, PostLikeToggleSerializer


class PostListCreateView(generics.ListCreateAPIView):
    """
    List posts (annotated with like/dislike counts and optionally prefetched user's reaction)
    and create post.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # annotate counts using reaction values (not is_like)
        base_qs = Post.objects.filter(user=user).annotate(
            likes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_LIKE)),
            dislikes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_DISLIKE)),
        ).select_related('user')

        if user.is_authenticated:
            # Prefetch only this user's PostLike rows and stash to_attr='user_like_rows'
            user_like_qs = PostLike.objects.filter(user=user)
            return base_qs.prefetch_related(Prefetch('likes', queryset=user_like_qs, to_attr='user_like_rows'))
        return base_qs


    
    def perform_create(self, serializer):
        """Attach the current user when creating a post."""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Validate & save (perform_create will set user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Re-fetch the created post with the same annotations/prefetch used in get_queryset.
        # This ensures the response includes likes_count/dislikes_count and user_like_rows.
        post = (
            Post.objects.filter(user=request.user)
            .annotate(
                likes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_LIKE)),
                dislikes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_DISLIKE)),
            )
            .prefetch_related(Prefetch('likes', queryset=PostLike.objects.filter(user=request.user), to_attr='user_like_rows'))
            .select_related('user')
            .get(id=serializer.instance.id)
        )

        return Response(
            {
                'message': 'Post created successfully',
                'post': PostSerializer(post, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(generics.RetrieveDestroyAPIView):
    """
    Retrieve or delete a single post. Uses same annotation/prefetch as list.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        base_qs = Post.objects.annotate(
            likes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_LIKE)),
            dislikes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_DISLIKE)),
        ).select_related('user')

        if user.is_authenticated:
            user_like_qs = PostLike.objects.filter(user=user)
            return base_qs.prefetch_related(Prefetch('likes', queryset=user_like_qs, to_attr='user_like_rows'))
        return base_qs


class PostReactToggleAPIView(APIView):
    """
    Toggle like/dislike for the authenticated user on a post.
    Expects POST with {"action": "like"} or {"action": "dislike"}.
    Returns {"reaction": "like"|"dislike"|"none"}.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        # validate input with your serializer
        serializer = PostLikeToggleSerializer(data=request.data, context={"request": request, "post_id": post_id})
        serializer.is_valid(raise_exception=True)
        post_like = serializer.save()

        # Return the resulting reaction explicitly for frontend
        return Response({"reaction": post_like.reaction}, status=status.HTTP_200_OK)
