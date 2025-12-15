
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator


class Post(models.Model):
    """Post model for user posts"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    description = models.TextField()
    image = models.ImageField(
        upload_to='post_images/',
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
    
    def __str__(self):
        return f"Post by {self.user.email} - {self.created_at.strftime('%Y-%m-%d')}"
    
 
class PostLike(models.Model):
    REACTION_NONE = "none"
    REACTION_LIKE = "like"
    REACTION_DISLIKE = "dislike"

    REACTION_CHOICES = [
        (REACTION_NONE, "No Reaction"),
        (REACTION_LIKE, "Like"),
        (REACTION_DISLIKE, "Dislike"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='post_likes'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    reaction = models.CharField(
        max_length=10,
        choices=REACTION_CHOICES,
        default=REACTION_NONE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'post_likes'
        unique_together = ('user', 'post')  # one row per user+post
        verbose_name = 'Post Like'
        verbose_name_plural = 'Post Likes'

    def __str__(self):
        return f"{self.user.email} {self.reaction} post {self.post.id}"



# posts/views.py
# from django.db.models import Count, Q, Prefetch
# from rest_framework import generics, status, permissions
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404

# from .models import Post, PostLike
# from .serializers import PostSerializer, PostLikeToggleSerializer


# class PostListCreateView(generics.ListCreateAPIView):
#     """
#     List posts (annotated with like/dislike counts and optionally prefetched user's reaction)
#     and create post.
#     """
#     serializer_class = PostSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]

#     def get_queryset(self):
#         user = self.request.user
#         # annotate counts using reaction values (not is_like)
#         base_qs = Post.objects.annotate(
#             likes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_LIKE)),
#             dislikes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_DISLIKE)),
#         ).select_related('user')

#         if user.is_authenticated:
#             # Prefetch only this user's PostLike rows and stash to_attr='user_like_rows'
#             user_like_qs = PostLike.objects.filter(user=user)
#             return base_qs.prefetch_related(Prefetch('likes', queryset=user_like_qs, to_attr='user_like_rows'))
#         return base_qs


# class PostDetailView(generics.RetrieveDestroyAPIView):
#     """
#     Retrieve or delete a single post. Uses same annotation/prefetch as list.
#     """
#     serializer_class = PostSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#     lookup_field = 'pk'

#     def get_queryset(self):
#         user = self.request.user
#         base_qs = Post.objects.annotate(
#             likes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_LIKE)),
#             dislikes_count=Count('likes', filter=Q(likes__reaction=PostLike.REACTION_DISLIKE)),
#         ).select_related('user')

#         if user.is_authenticated:
#             user_like_qs = PostLike.objects.filter(user=user)
#             return base_qs.prefetch_related(Prefetch('likes', queryset=user_like_qs, to_attr='user_like_rows'))
#         return base_qs


# class PostReactToggleAPIView(APIView):
#     """
#     Toggle like/dislike for the authenticated user on a post.
#     Expects POST with {"action": "like"} or {"action": "dislike"}.
#     Returns {"reaction": "like"|"dislike"|"none"}.
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, post_id):
#         # validate input with your serializer
#         serializer = PostLikeToggleSerializer(data=request.data, context={"request": request, "post_id": post_id})
#         serializer.is_valid(raise_exception=True)
#         post_like = serializer.save()

#         # Return the resulting reaction explicitly for frontend
#         return Response({"reaction": post_like.reaction}, status=status.HTTP_200_OK)
