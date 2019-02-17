---
layout: post
---

<p>
{% for post in site.posts %}
    <h4><a href="{{ post.url }}">{{ post.title }}</a></h4>
    {{ post.excerpt }}
    <br />
    <br />
{% endfor %}
</p>
