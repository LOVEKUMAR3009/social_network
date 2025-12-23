from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.db.models import Count, Q, Prefetch

from .models import Post, PostLike, Comment


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    image_url = serializers.SerializerMethodField()
    user_profile_picture = serializers.SerializerMethodField()

    # Annotated in the view (recommended). Keep read_only so serializer won't try to write.
    likes_count = serializers.IntegerField(read_only=True)
    dislikes_count = serializers.IntegerField(read_only=True)

    # Exposes current authenticated user's reaction on this post (or None).
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'description', 'image', 'image_url', 'user_profile_picture',
            'likes_count', 'dislikes_count', 'user_reaction',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'likes_count', 'dislikes_count', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if getattr(obj, 'image', None) and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_user_profile_picture(self, obj):
        request = self.context.get('request')
        user = getattr(obj, 'user', None)
        if user and getattr(user, 'profile_picture', None) and request:
            return request.build_absolute_uri(user.profile_picture.url)
        return None

    def get_user_reaction(self, obj):
        """
        Return the reaction string for the current authenticated user on this post,
        e.g. 'like' or 'dislike', or None if no reaction (or reaction == REACTION_NONE).
        Uses a prefetched attribute `user_like_rows` when available to avoid N+1.
        """
        request = self.context.get('request')
        if not request or not getattr(request, 'user', None) or not request.user.is_authenticated:
            return None

        # Preferred: use prefetched user_like_rows (set in the view via Prefetch(..., to_attr='user_like_rows'))
        rows = getattr(obj, 'user_like_rows', None)
        if rows is not None:
            pl = rows[0] if rows else None
            if not pl:
                return None
            return pl.reaction if pl.reaction != PostLike.REACTION_NONE else None

        # Fallback: single lightweight DB lookup
        reaction = PostLike.objects.filter(user=request.user, post=obj).values_list('reaction', flat=True).first()
        if reaction == PostLike.REACTION_NONE:
            return None
        return reaction


class PostLikeSerializer(serializers.ModelSerializer):
    """Serializer for PostLike model"""
    class Meta:
        model = PostLike
        # changed 'is_like' -> 'reaction'
        fields = ['id', 'user', 'post', 'reaction', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class PostLikeToggleSerializer(serializers.Serializer):
    """
    Serializer to toggle like/dislike reactions on a post.

    Expects context to include:
      - request
      - post_id (int)
    """
    action = serializers.ChoiceField(
        choices=[PostLike.REACTION_LIKE, PostLike.REACTION_DISLIKE],
        required=True
    )

    def validate(self, attrs):
        request = self.context.get("request")
        post_id = self.context.get("post_id")
        if not request or not getattr(request, 'user', None) or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # Fetch post or 404
        post = get_object_or_404(Post, id=post_id)

        attrs["post"] = post
        attrs["user"] = request.user
        return attrs

    def save(self):
        """
        Toggle behavior:
         - same action -> set to NONE
         - different action -> set to action
         - none -> set to action
        Returns the PostLike instance (saved).
        """
        action = self.validated_data["action"]  # incoming: 'like' or 'dislike'
        post = self.validated_data["post"]
        user = self.validated_data["user"]

        post_like, created = PostLike.objects.get_or_create(
            post=post,
            user=user,
            defaults={"reaction": PostLike.REACTION_NONE}
        )

        # Toggle logic
        if post_like.reaction == action:
            # same action -> turn into none
            post_like.reaction = PostLike.REACTION_NONE
        else:
            # switch to the requested action
            post_like.reaction = action

        post_like.save()
        return post_like


class CommentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'user_id',
            'user_email',
            'text',
            'created_at',
        ]

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text']
