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

class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} commented on {self.post.id}"
